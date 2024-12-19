import { router } from "../router"

const redirectHome = () => router.push({ path: "/" })
const redirectTeamsList = () => router.push({ path: "/teams" })
const redirectTeamsNew = () => router.push({ path: "/teams/new" })
const redirectOrganizationsList = () => router.push({ path: "/organizations" })
const redirectOrganizationsNew = () => router.push({ path: "/organizations/new" })
const redirectUsersList = () => router.push({ path: "/users" })
const redirectUsersNew = () => router.push({ path: "/users/new" })
const redirectProjectsList = () => router.push({ path: "/projects" })
const redirectProjectsNew = () => router.push({ path: "/projects/new" })

export {
    redirectHome,

    redirectTeamsList,
    redirectTeamsNew,

    redirectOrganizationsList,
    redirectOrganizationsNew,

    redirectUsersList,
    redirectUsersNew,

    redirectProjectsList,
    redirectProjectsNew,
}