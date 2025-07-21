// App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import JAccount from "./pages/JAccount";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Matches from "./pages/match/Matches";
import MatchDetail from "./pages/match/MatchDetail";
import Teams from "./pages/team/Teams";
import User from "./pages/user/User";
import Error from "./pages/Error";
import TeamDetail from "./pages/team/TeamDetail.jsx";
import PrivateRoute from "./layouts/PrivateRoute.jsx";

const Router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/auth/jaccount/callback",
    element: <JAccount />,
    errorElement: <Error />,
  },
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "matches",
        element: <Matches />,
      },
      {
        path: "matches/:match_uuid",
        element: <MatchDetail />,
      },
      {
        path: "teams",
        element: (
          <PrivateRoute>
            <Teams />
          </PrivateRoute>
        ),
      },
      {
        path: "teams/:team_id",
        element: (
          <PrivateRoute>
            <TeamDetail />
          </PrivateRoute>
        ),
      },
      {
        path: "users/:user_id",
        element: (
          <PrivateRoute>
            <User />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={Router} />;
}

export default App;
