// src/configure/MenuConfig.js
import {
  MenuOutlined,
  BugOutlined,
  UsergroupAddOutlined,
  DashboardOutlined,
  ControlOutlined,
  FileSearchOutlined,
  WechatWorkOutlined
} from '@ant-design/icons';
import { LEFT_NAMES } from '../configure/MyUtilsConfig';

const MenuConfig = {
  ADMIN: [
    {
      name: LEFT_NAMES.DASHBOARD,
      key: 'sub1',
      icon: <DashboardOutlined />,
      children: [
        { name: LEFT_NAMES.DASHBOARD_REPORT, key: 'DashboardReport', path: '/DashboardReport' },
        { name: LEFT_NAMES.FARMERS_DRILLDOWN_REPORT, key: 'farmersDrillDownReport', path: '/farmersDrillDownReport' },
        { name: LEFT_NAMES.FARMERS_OVERVIEW_REPORT, key: 'farmersOverviewReport', path: '/farmersOverviewReport' },
        { name: LEFT_NAMES.PROBLEMS_SUMMARY_REPORT, key: 'problemsSummaryReport', path: '/problemsSummaryReport' },
        {
          name: LEFT_NAMES.PEST_NUTRITION_DISEASE_SUMMARY_REPORT,
          key: 'pestNutitionDiseaseSummaryReport',
          path: '/pestNutitionDiseaseSummaryReport'
        }
      ]
    },
    {
      name: LEFT_NAMES.FARMERS,
      key: 'sub2',
      icon: <FileSearchOutlined />,
      children: [
        { name: LEFT_NAMES.FARMER, key: 'Farmer', path: '/Farmer' },
        { name: LEFT_NAMES.PROBLEMS_REPORT, key: 'ProblemsReport', path: '/ProblemsReport' }
      ]
    },
    {
      name: LEFT_NAMES.BROADCAST_MANAGEMENT,
      key: 'sub4',
      icon: <WechatWorkOutlined />,
      children: [
        { name: LEFT_NAMES.NEW_BROADCAST, path: '/newBroadcast', key: 'newBroadcast' },
        { name: LEFT_NAMES.BROADCAST_REPORT, path: '/broadcastReport', key: 'broadcastReport' }
      ]
    },
    {
      name: LEFT_NAMES.MASTERS,
      key: 'sub5',
      icon: <MenuOutlined />,
      children: [
        { name: LEFT_NAMES.DISTRICT, key: 'District', path: '/District' },
        { name: LEFT_NAMES.MANDAL, key: 'Mandal', path: '/Mandal' },
        { name: LEFT_NAMES.VILLAGE, key: 'Village', path: '/Village' },
        { name: LEFT_NAMES.CROP, key: 'Crop', path: '/Crop' },
        { name: LEFT_NAMES.PESTS, key: 'pests', path: '/pests' },
        { name: LEFT_NAMES.CROP_ADVISORY, key: 'cropAdvisory', path: '/cropAdvisory' },
        {
          name: LEFT_NAMES.DISTRICT_MANDAL_VILLAGE_UPLOAD,
          key: 'DistrictMandalvillageEXcel',
          path: '/DistrictMandalvillageEXcel'
        }
      ]
    },

    {
      name: LEFT_NAMES.PROJECTS,
      key:'projects',
      path:'/projects',
      icon: <ControlOutlined />,
      
    },
    {
      name: LEFT_NAMES.USER_MANAGEMENT,
      key: 'UserManagement',
      path: '/UserManagement',
      icon: <UsergroupAddOutlined />
    },
    {
      name: LEFT_NAMES.BUGS_REPORT,
      key: 'bugsReport',
      path: '/bugsReport',
      icon: <BugOutlined />
    },
    

  ]
};

export default MenuConfig;
