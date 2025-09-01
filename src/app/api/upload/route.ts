import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple PIN validation - you can enhance this
const UPLOAD_PIN = process.env.UPLOAD_PIN || "fantasy2025";

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const authHeader = req.headers.get("authorization");
    const pin = authHeader?.replace("Bearer ", "");
    
    if (pin !== UPLOAD_PIN) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const title = form.get("title");
    const teamId = form.get("teamId");
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    if (!title || !teamId) {
      return NextResponse.json({ error: "Title and Team ID required" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload MP4, WebM, MOV, or AVI" }, { status: 400 });
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 500MB" }, { status: 400 });
    }

    // Verify team exists
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Invalid Team ID" }, { status: 400 });
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `team-${teamId}-${timestamp}-${randomStr}.${fileExt}`;
    const path = `videos/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Videos")
      .upload(path, file, { 
        upsert: false, 
        contentType: file.type,
        cacheControl: "3600"
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("Videos")
      .getPublicUrl(path);

    // Save to database with team association
    const { data: videoData, error: dbError } = await supabase
      .from("videos")
      .insert({
        title: title.toString(),
        url: publicUrl,
        team_id: teamId.toString(),
        featured: false,
        featured_rank: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await supabase.storage.from("Videos").remove([path]);
      return NextResponse.json({ error: "Failed to save video metadata" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      video: videoData,
      message: `Video uploaded successfully for ${team.name}!`
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "An unexpected error occurred" 
    }, { status: 500 });
  }
}