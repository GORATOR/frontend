import { router } from "../router"

const gotoHome = () => router.push({ path: "/" })
const gotoTeamsList = () => router.push({ path: "/teams" })
const gotoTeamsNew = () => router.push({ path: "/teams/new" })

export { 
    gotoHome,
    gotoTeamsList,
    gotoTeamsNew
 }