
export const THEME_RED = {
    token: {
      bgSiderLayout: 'green',
      // bgSider:'green',
      colorPrimary: '#ff6f61', 
      colorLink: '#ff6f61', 
      colorLinkHover: '#ff6f61',
      sider: {
        backgroundColor: 'green',
        colorTextMenuActive: "red",
        colorTextMenuSelected: "green",
        colorBgMenuItemSelected: "yellow",
        colorBgMenuItemHover: "red",
        colorTextMenuItemHover: "white"
      }
    }, 
};

export const ORANGE_COLORS_CODES={
  // Primary:'#00152A',  //primary color , text color after menu collapse
  // itemHover:"#4096FF", //item selected and item hover
  // colorTextMenuSelected:'#eddfdf',  //sider text color before collapse ,selcted menu text color 
  // ToggleIcon:"white", // toggle button color when browser minimised
  // OntextHover:'white', // when mouse hover on item text color

  token: {
    colorPrimary: '#008945', // Primary color used across the app
        //  colorPrimary: '#F92A3C', // Primary color used across the app

    colorLink: '#F92A3C',    
    // colorLink: '#008945',    

    },
    components: {
     

      Button: {
        colorPrimary: '#F92A3C',
        colorPrimaryHover: '#d92032',
        colorPrimaryActive: '#b71c2b',
        colorPrimaryText: '#ffffff',
        colorPrimaryBorder: '#F92A3C',
        colorPrimaryShadow: '0 0 0 2px rgba(249, 42, 60, 0.2)', // custom shadow with red glow
        controlOutline: 'rgba(249, 42, 60, 0.2)', // outline/focus ring when focused
      },


      
      // Button: {
      //   colorPrimary: '#F92A3C',          // main button color
      //   colorPrimaryHover: '#F92A3C',     // slightly darker on hover
      //   colorPrimaryActive: '#F92A3C',    // active (pressed) state
      //   colorText: '#F92A3C',             // button text color
      // },



    },
 }

export const THEME_GREEN = {
  token: {
    colorPrimary: '#28a745', 
    colorLink: '#28a745',
    colorLinkHover: '#218838',
  },
  components: {
    Layout: {
      colorBgHeader: '#d4edda', 
      siderBg: '#28a745', 
    },
    Menu: {
      colorItemBg: '#28a745', 
      colorSubItemBg: '#d4edda', 
      colorItemBgSelected: '#218838', 
      colorItemBgHover: '#34c38f', 
      colorItemText: '#ffffff', 
      colorItemTextSelected: '#ffffff', 
    },

  },
};


export const Theme_Blue = {
  header: {
        colorBgHeader: '#093c97', // when i minimize browser , header color
        colorBgHeaderSecondary: '#093c97', // Change header color when minimized
        colorTextMenuSelected: '#fff',
        colorTextMenu: 'white',
        colorTextMenuSecondary: '#4E31AA',
        colorTextMenuActive: '#4E31AA',
        colorHeaderTitle: 'white',
      },
      
  token: {
    colorPrimary: '#1a73e8', // Primary color used across the app
  }
};


export const THEME_ORANGE = {
  header: {
        colorBgHeader: '#F37E1C', // when i minimize browser , header color
        colorBgHeaderSecondary: '#F37E1C', // Change header color when minimized
        colorTextMenuSelected: '#fff',
        colorTextMenu: 'white',
        colorTextMenuSecondary: '#4E31AA',
        colorTextMenuActive: '#4E31AA',
        colorHeaderTitle: 'white',
      },
      
  token: {
    colorPrimary: '#F37E1C', // Primary color used across the app
  }
};








export const  Theme_Purple ={
 
  colorBgAppListIconHover: 'rgba(0,0,0,0.06)',
  colorTextAppListIconHover: 'rgba(255,255,255,0.95)',
  colorTextAppListIcon: '#4E31AA',
  sider: {
        colorBgCollapsedButton: '#fff', // collapse button
        colorTextCollapsedButtonHover: '#6C48C5',  // collapse button
        colorTextCollapsedButton: 'rgba(0,0,0,0.45)', // collapse button
        colorMenuBackground: '#6C48C5',  // sider menu background
        colorBgMenuItemHover: '#7C00FE', // item over
        colorBgMenuItemSelected: '#7C00FE', // selected menu item color
        colorBgSider: '#001529',

        colorTextMenuItemHover: '#6C48C5', // when mouse over on item , change color 
        colorTextMenuSelected: 'white', // text color for selected item
        colorTextMenuItemHover: 'white',  // text color when mouse over
        colorTextMenu: 'white', // text color 
      },
      header: {
        colorBgHeader: '#6C48C5',
        colorBgRightActionsItemHover: '#6C48C5', //background  when  i hover user icon ,
        colorHeaderTitle: 'white', // header toggle button, when browser minimise
        colorTextMenuSelected: '#fff',
        colorTextMenu: 'black',
        colorTextMenuSecondary: 'rgba(255,255,255,0.65)',
        colorTextMenuActive: 'rgba(255,255,255,0.95)',
      },
  token: {
  colorPrimary: '#6C48C5', // Primary color (affects buttons, inputs, etc.)
  colorBgBase: '#fff',  // Background color
  colorTextBase: 'black', 
  }
}



// export const THEME_ORANGE_1 = {
//   header: {
//     colorBgHeader: '#f17a19', // when i minimize browser , header color
//     colorBgHeaderSecondary: '#f17a19', // Change header color when minimized
//     colorTextMenuSelected: '#fff',
//     colorTextMenu: 'white',
//     colorTextMenuSecondary: '#4E31AA',
//     colorTextMenuActive: '#4E31AA',
//     colorHeaderTitle: 'white',
//   },
  

// };