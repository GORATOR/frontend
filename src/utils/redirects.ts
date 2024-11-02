import { Router } from "vue-router"

const gotoHome = (router: Router) => router.push({ path: "/" })
const gotoTeamsList = (router: Router) => router.push({ path: "/teams" })
const gotoTeamsNew = (router: Router) => router.push({ path: "/teams/new" })

export { 
    gotoHome,
    gotoTeamsList,
    gotoTeamsNew
 }