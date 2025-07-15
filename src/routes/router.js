import React from "react";
import { createHashRouter } from "react-router-dom";
import LoginComponent from '../Login/LoginComponent.js';
import MainContent from "../layout/MainContent.js";

import ErrorPage from "./ErrorPage.js";
import BugsReport from "../bugReport/BugsReport.js";
import UserManagement from "../masters/UserManagement.js";
import ProtectedRoute from "./ProtectedRoute.js";
import PrivacyPolicy from "../PrivacyPolicy.js";
import District from "../masters/District.js";
import Mandal from "../masters/Mandal.js";
import Village from "../masters/Village.js";
import Crop from "../masters/Crop.js";
import Pests from "../masters/Pests.js";
import Farmer from "../Farmers/Farmer.js";
import CropAdvisory from "../masters/CropAdvisory.js";
import ProblemsReport from "../Farmers/ProblemsReport.js";
import NewBroadcast from "../broadcastManagement/NewBroadcast.js";
import BroadcastReport from "../broadcastManagement/BroadcastReport.js";
import DashboardReport from "../Dashboard/DashboardReport.js";
import FarmersDrillDownReport from "../Dashboard/FarmersDrillDownReport.js";
import FarmersOverviewReport from "../Dashboard/FarmersOverviewReport.js";
import ProblemsSummaryReport from "../Dashboard/ProblemsSummaryReport.js";
import PestNutitionDiseaseSummaryReport from "../Dashboard/PestNutitionDiseaseSummaryReport.js";
import DistrictMandalvillageEXcel from "../masters/DistrictMandalvillageEXcel.js";
import Project from "../Project.js";

const router = createHashRouter(
  [
    {
      path: "",
      element: <LoginComponent />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/privacyPolicy",
      element: <PrivacyPolicy />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/",
      element: <MainContent />,
      errorElement: <ErrorPage />,
      children: [
         
        { path: 'UserManagement', element: <UserManagement /> },
        { path: "bugsReport", element: <BugsReport /> },
        { path: "projects", element:<Project />},
        { path: 'District', element:  <District/> },
        { path: 'Mandal', element: <Mandal/> },

        { path: 'Village', element: <Village/> },
        { path: 'Crop', element: <Crop/> },
        { path: 'Pests', element: <Pests/> },
        { path: 'Farmer', element: <Farmer/> },
        { path: 'ProblemsReport', element: <ProblemsReport/> },

        { path: 'newBroadcast', element: <NewBroadcast /> },
        { path: 'broadcastReport', element: <BroadcastReport /> },
        { path: 'cropAdvisory', element: <CropAdvisory /> },


        { path: 'DashboardReport', element: <DashboardReport /> },
           { path: 'farmersDrillDownReport', element: <FarmersDrillDownReport /> },
          
           { path: 'farmersOverviewReport', element: <FarmersOverviewReport /> },
                    { path: 'problemsSummaryReport', element: <ProblemsSummaryReport /> },
                    
                    { path: 'pestNutitionDiseaseSummaryReport', element: <PestNutitionDiseaseSummaryReport /> },
                    
                    { path: 'districtMandalvillageEXcel', element: <DistrictMandalvillageEXcel/> },



      ],
    },
  ]);

export default router;

