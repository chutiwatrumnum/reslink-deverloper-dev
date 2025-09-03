import { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import { APP_VERSION } from "../../configs/configs";
import { callConfirmModal } from "../../components/common/Modal";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  LogOutIcon,
  UserManagementIcon,
  ResidentManagementIcon,
  DeveloperTeamIcon,
  DeveloperTeamInvitationsIcon,
  DeveloperTeamListIcon,
  DeveloperTeamPermissionIcon,
  ProjectTeamIcon,
  ProjectInvitationsIcon,
  ProjectListIcon,
  ProjectManagementIcon,
  LicenseManageIcon,
  LicenseIcon,
  NewsIcon,
  ProfileIcon,
} from "../../assets/icons/Icons";
import IconLoader from "../common/IconLoader";

import MENU_LOGO from "../../assets/images/LogoNexres.png";
import "../styles/sideMenu.css";

// Custom CSS สำหรับ badge animations
const badgeAnimationStyles = `
  @keyframes emergencyPulse {
    0% { 
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    100% { 
      box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
    }
  }
  
  @keyframes warningPulse {
    0% { 
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    }
    100% { 
      box-shadow: 0 0 0 20px rgba(245, 158, 11, 0);
    }
  }
  
  .emergency-badge {
    animation: emergencyPulse 1.5s ease-in-out infinite;
  }
  
  .warning-badge {
    animation: warningPulse 1.5s ease-in-out infinite;
  }
`;

// เพิ่ม styles ลงใน document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = badgeAnimationStyles;
  if (!document.head.querySelector("[data-badge-animations]")) {
    styleElement.setAttribute("data-badge-animations", "true");
    document.head.appendChild(styleElement);
  }
}

const { SubMenu } = Menu;
const main_link = "/dashboard";

const SideMenu = ({ onMenuChange }: { onMenuChange: () => void }) => {
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    // Default behavior: collapse on small screens, expand on large screens
    const isSmallScreen = window.innerWidth <= 1024;
    return isSmallScreen;
  });

  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    location.pathname,
  ]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);

  // Update selected keys when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKeys([currentPath]);

    // Find parent menu keys
    const findParentKeys = (pathname: string): string[] => {
      switch (true) {
        case pathname.includes("/juristicInvitation") ||
          pathname.includes("/juristicManage"):
          return ["managementTeam"];
        case pathname.includes("developerTeamInvitations") ||
          pathname.includes("developerTeamList") ||
          pathname.includes("developerTeamPermission"):
          return ["developerTeam"];
        case pathname.includes("/projectInvitations") ||
          pathname.includes("/projectList"):
          return ["projectTeam"];

        case pathname.includes("/licenseManagement") ||
          pathname.includes("/paymentHistory"):
          return ["license"];
        default:
          return [];
      }
    };

    if (!collapsed) {
      const parentKeys = findParentKeys(currentPath);
      setOpenKeys(parentKeys);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname, collapsed]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const currentIsLargeScreen = window.innerWidth > 1024;
      setIsLargeScreen(currentIsLargeScreen);

      if (!currentIsLargeScreen) {
        // Always collapse on small screens (tablet/mobile)
        setCollapsed(true);
      } else {
        // On large screens (desktop), always expand by default
        setCollapsed(false);
        localStorage.setItem("sideMenuCollapsed", "false");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save collapsed state (only for large screens)
  useEffect(() => {
    if (isLargeScreen) {
      localStorage.setItem("sideMenuCollapsed", collapsed.toString());
    }
    window.dispatchEvent(new Event("sideMenuCollapsed"));
  }, [collapsed, isLargeScreen]);

  const toggleCollapsed = () => {
    // Only allow manual toggle on large screens
    if (isLargeScreen) {
      setCollapsed(!collapsed);
    }
  };

  const logoutHandler = () => {
    callConfirmModal({
      title: "Do you want to log out?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        await dispatch.userAuth.onLogout();
        navigate("/auth", { replace: true });
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  // ฟังก์ชันเลือกสี icon
  const iconMenuColorSelector = (key: string) => {
    return "#3B82F6"; // สีฟ้าสำหรับ icons ทั่วไป
  };

  const iconSubMenuColorSelector = (key: string) => {
    return "#3B82F6"; // สีฟ้าสำหรับ submenu icons
  };

  return (
    <div className={`sideMenuContainer ${collapsed ? "collapsed" : ""}`}>
      <div className="sideMenuHeader">
        <div className="sideMenuLogo">
          {!collapsed ? (
            <img src={MENU_LOGO} alt="Reslink Logo" />
          ) : (
            <div className="collapsedLogo">R</div>
          )}
        </div>
        {isLargeScreen && (
          <button className="collapseToggle" onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        )}
      </div>

      <div className="menuWrapper">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          inlineCollapsed={collapsed}
          onSelect={({ key }) => {
            navigate(key);
            onMenuChange();
          }}
          onOpenChange={setOpenKeys}>
          <SubMenu
            key="developerTeam"
            icon={
              <DeveloperTeamIcon
                color={iconMenuColorSelector("developerTeam")}
                className="sideMenuIcon"
              />
            }
            title="Developer team">
            <Menu.Item
              key={`${main_link}/developerTeamInvitations`}
              icon={
                <DeveloperTeamInvitationsIcon
                  color={iconSubMenuColorSelector("developerTeamInvitations")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/developerTeamInvitations`}>
                Developer team invitations
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/developerTeamList`}
              icon={
                <DeveloperTeamListIcon
                  color={iconSubMenuColorSelector("developerTeamList")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/developerTeamList`}>
                Developer team list
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/developerTeamPermission`}
              icon={
                <DeveloperTeamPermissionIcon
                  color={iconSubMenuColorSelector("developerTeamPermission")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/developerTeamPermission`}>
                Developer team permission
              </Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item
            key={`${main_link}/developerNews`}
            icon={
              <NewsIcon
                color={iconSubMenuColorSelector("developerNews")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/developerNews`}>Developer news</Link>
          </Menu.Item>
          {/* 
          <Menu.Item
            key={`${main_link}/userManagement`}
            icon={
              <UserManagementIcon
                color={iconMenuColorSelector("userManagement")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/userManagement`}>User Management</Link>
          </Menu.Item> */}
          {/* <SubMenu
            key="managementTeam"
            icon={
              <UserManagementIcon
                color={iconMenuColorSelector("managementTeam")}
                className="sideMenuIcon"
              />
            }
            title="Management team">
            <Menu.Item
              key={`${main_link}/juristicInvitation`}
              icon={
                <ResidentManagementIcon
                  color={iconSubMenuColorSelector("juristicInvitation")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/juristicInvitation`}>menu 1</Link>
            </Menu.Item>

            <Menu.Item
              key={`${main_link}/juristicManage`}
              icon={
                <ResidentManagementIcon
                  color={iconSubMenuColorSelector("juristicManage")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/juristicManage`}>menu 2</Link>
            </Menu.Item>
          </SubMenu> */}
          {/* Project Team */}
          <SubMenu
            key="projectTeam"
            icon={
              <ProjectTeamIcon
                color={iconMenuColorSelector("projectTeam")}
                className="sideMenuIcon"
              />
            }
            title="Project Team">
            <Menu.Item
              key={`${main_link}/projectInvitations`}
              icon={
                <ProjectInvitationsIcon
                  color={iconSubMenuColorSelector("projectInvitations")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/projectInvitations`}>
                Project invitation
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/projectList`}
              icon={
                <ProjectListIcon
                  color={iconSubMenuColorSelector("projectList")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/projectList`}>Project team list</Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item
            key={`${main_link}/projectManagement`}
            icon={
              <ProjectManagementIcon
                color={iconMenuColorSelector("projectManagement")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/projectManagement`}>
              Project management
            </Link>
          </Menu.Item>
          <Menu.Item
            key={`${main_link}/profile`}
            icon={
              <ProfileIcon
                color={iconMenuColorSelector("profile")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/profile`}>Profile</Link>
          </Menu.Item>
          {/* License manage */}
          <SubMenu
            key="licenseManagement"
            icon={
              <LicenseManageIcon
                color={iconSubMenuColorSelector("licenseManagement")}
                className="sideMenuIcon"
              />
            }
            title="License management">
            <Menu.Item
              key={`${main_link}/license`}
              icon={
                <LicenseIcon
                  color={iconSubMenuColorSelector("license")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/license`}>License</Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      </div>
      <div className="sideMenuFooter">
        <Menu mode="inline" selectable={false} inlineCollapsed={collapsed}>
          <Menu.Item
            key="logout"
            icon={
              <LogOutIcon
                color="#9CA3AF" // สีเทาสำหรับ logout
                className="sideMenuIcon"
              />
            }
            onClick={logoutHandler}>
            <span style={{ color: "#9CA3AF" }}>Logout</span>
          </Menu.Item>
        </Menu>
        {!collapsed && <div className="textVersion">version {APP_VERSION}</div>}
      </div>
    </div>
  );
};

export default SideMenu;
