import { router } from "../router"

const redirectHome = () => router.push({ path: "/" })

const redirectTeamsList = () => router.push({ path: "/teams" })
const redirectTeamsNew = () => router.push({ path: "/teams/new" })

const redirectOrganizationsList = () => router.push({ path: "/organizations" })
const redirectOrganizationsNew = () => router.push({ path: "/organizations/new" })

export {
    redirectHome,

    redirectTeamsList,
    redirectTeamsNew,

    redirectOrganizationsList,
    redirectOrganizationsNew
}