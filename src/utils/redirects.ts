import { router } from "../router"
import { useUserStore } from "../store/user"

const redirectHome = () => router.push({ path: "/" })
const redirectTeamsList = () => router.push({ path: "/teams" })
const redirectTeamsNew = () => router.push({ path: "/teams/new" })
const redirectOrganizationsList = () => router.push({ path: "/organizations" })
const redirectOrganizationsNew = () => router.push({ path: "/organizations/new" })
const redirectUsersList = () => router.push({ path: "/users" })
const redirectUsersNew = () => router.push({ path: "/users/new" })
const redirectProjectsList = () => router.push({ path: "/projects" })
const redirectProjectsNew = () => router.push({ path: "/projects/new" })
const redirectIssuesList = () => router.push({ path: "/issues" })
const redirectUserProfile = () => {
    const userStore = useUserStore()
    if (userStore.currentUserId) {
        router.push({ path: `/user/${userStore.currentUserId}` })
    }
}

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

    redirectIssuesList,
    redirectUserProfile,
}