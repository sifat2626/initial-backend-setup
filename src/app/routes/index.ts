import express from "express"
import { userRoutes } from "../modules/User/user.route"
import { AuthRoutes } from "../modules/Auth/auth.routes"
import { ClubRoutes } from "../modules/Club/club.route"
import { CourtRoutes } from "../modules/Court/court.route"
import { MemberRoutes } from "../modules/Member/member.route"
import { Session } from "inspector"
import { SessionRoutes } from "../modules/Session/session.route"
import { SessionParticipantRoutes } from "../modules/SessionParticipant/sessionParticipant.route"
import { SessionCourtRoutes } from "../modules/SessionCourt/sessionCourt.route"
import { MatchRoutes } from "../modules/Match/match.route"
import { MatchParticipantRoutes } from "../modules/MatchParticipant/matchParticipant.route"
import { MatchPoolRoutes } from "../modules/MatchPool/matchPool.route"

const router = express.Router()

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/clubs",
    route: ClubRoutes,
  },
  {
    path: "/courts",
    route: CourtRoutes,
  },
  {
    path: "/members",
    route: MemberRoutes,
  },
  {
    path: "/sessions",
    route: SessionRoutes,
  },
  {
    path: "/session-participants",
    route: SessionParticipantRoutes,
  },
  {
    path: "/session-courts",
    route: SessionCourtRoutes,
  },
  {
    path: "/matches",
    route: MatchRoutes,
  },
  {
    path: "/match-participants",
    route: MatchParticipantRoutes,
  },
  {
    path: "/match-pools",
    route: MatchPoolRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
