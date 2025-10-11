// App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HotkeysProvider } from "react-hotkeys-hook";
import { SnackbarProvider } from "notistack";
import { styleSnackbar } from "./styles/styles.jsx";
import { ConfirmProvider } from "material-ui-confirm";
import { Grow } from "@mui/material";
import Login from "./pages/Login";
import JAccount from "./pages/JAccount";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Contests from "./pages/contest/Contests";
import ContestDetail from "./pages/contest/ContestDetail";
import Teams from "./pages/team/Teams";
import User from "./pages/user/User";
import Error from "./pages/Error";
import TeamDetail from "./pages/team/TeamDetail.jsx";
import PrivateRoute from "./layouts/PrivateRoute.jsx";
import AdminRoute from "./layouts/AdminRoute.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CreateContest from "./pages/admin/CreateContest.jsx";
import CreateUser from "./pages/admin/CreateUser.jsx";
import ViewContests from "./pages/admin/ViewContests.jsx";
import ContestEdit from "./pages/admin/EditContest.jsx";
import ManageNews from "./pages/admin/ManageNews.jsx";

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
        path: "contests",
        element: <Contests />,
      },
      {
        path: "contests/:contest_id",
        element: <ContestDetail />,
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
        path: "contests/:contest_id/teams",
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
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "create-contest",
            element: <CreateContest />,
          },
          {
            path: "create-user",
            element: <CreateUser />,
          },
          {
            path: "view-contests",
            element: <ViewContests />,
          },
          {
            path: "edit-contest/:contest_id",
            element: <ContestEdit />,
          },
          {
            path: "manage-news",
            element: <ManageNews />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <HotkeysProvider initiallyActiveScopes={["global"]}>
      <SnackbarProvider
        Components={{
          success: styleSnackbar,
          error: styleSnackbar,
          warning: styleSnackbar,
          info: styleSnackbar,
          default: styleSnackbar,
        }}
        TransitionComponent={Grow}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <ConfirmProvider defaultOptions={{ dialogProps: { maxWidth: "xs" } }}>
          <RouterProvider router={Router} />
        </ConfirmProvider>
      </SnackbarProvider>
    </HotkeysProvider>
  );
}

export default App;
