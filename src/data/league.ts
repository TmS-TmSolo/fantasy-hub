export type Owner={id:string;displayName:string};
export type Team={id:string;name:string;ownerId:string;abbrev?:string;logoUrl?:string};
export type SeasonRecord={season:number;wins:number;losses:number;ties?:number;pointsFor?:number;pointsAgainst?:number;finish?:number};
export type TeamHistory={teamId:string;records:SeasonRecord[]};
export type LeagueMeta={espn:{leagueId:string;seasonId:number;url:string};name:string;scoring:string};
export type LeagueData={meta:LeagueMeta;owners:Owner[];teams:Team[];history:TeamHistory[]};

export const league:LeagueData={
  meta:{espn:{leagueId:"829077",seasonId:2025,url:"https://fantasy.espn.com/football/league?leagueId=829077&seasonId=2025"},name:"All 'Bout That Action Boss!",scoring:"PPR"},
  owners:[
    {id:"matt_young",displayName:"Matt Young"},
    {id:"brennen_hall",displayName:"Brennen Hall"},
    {id:"michael_vlahovich",displayName:"Michael Vlahovich"},
    {id:"cole_bixenman",displayName:"Cole Bixenman"},
    {id:"matthew_hart",displayName:"Matthew Hart"},
    {id:"rob_thomas",displayName:"Rob Thomas"},
    {id:"thomas_young",displayName:"Thomas Young"},
    {id:"davis_johnson",displayName:"Davis Johnson"},
    {id:"brad_carter",displayName:"Brad Carter"},
    {id:"troy_scott",displayName:"Troy Scott"},
    {id:"brady_kincannon",displayName:"Brady Kincannon"},
    {id:"andy_fox",displayName:"Andy Fox"},
    {id:"brockton_gates",displayName:"Brockton Gates"},
  ],
  teams:[
    {id:"1",name:"Young and Reckless",ownerId:"matt_young",abbrev:"Bro"},
    {id:"2",name:"Return of the Gypsy king",ownerId:"brennen_hall",abbrev:"2025"},
    {id:"3",name:"McConkey Kong and Friends",ownerId:"michael_vlahovich",abbrev:"🦍"},
    {id:"4",name:"Dumbest Adult in the Room",ownerId:"cole_bixenman",abbrev:"🗑️"},
    {id:"5",name:"Fantasy Daddy",ownerId:"matthew_hart",abbrev:"Dad"},
    {id:"6",name:"Girth Brooks",ownerId:"rob_thomas",abbrev:"Hog"},
    {id:"7",name:"Dereleek My Metcalf",ownerId:"thomas_young",abbrev:"WS"},
    {id:"8",name:"The Ikea Vikings",ownerId:"davis_johnson",abbrev:"Swed"},
    {id:"9",name:"The Architecht",ownerId:"brad_carter",abbrev:"BC"},
    {id:"10",name:"Dirty Mike and Da Little Rickys",ownerId:"troy_scott",abbrev:".com"},
    {id:"11",name:"El Presidente of the Tuck",ownerId:"brady_kincannon",abbrev:"PREZ"},
    {id:"12",name:"Pirates of the Minge",ownerId:"andy_fox",abbrev:"Fox"},
  ],
  history:[]
};

export const getTeamById=(id:string)=>league.teams.find(t=>t.id===id);
export const getOwnerById=(id:string)=>league.owners.find(o=>o.id===id);
