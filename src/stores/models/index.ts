import { Models } from "@rematch/core";
import { announcement } from "./Announcement";
import { userAuth } from "./UserAuthModel";
import { common } from "./CommonModel";
import { juristic } from "./JuristicModel";
import { developerTeam } from "./DeveloperTeamModel";
import { projectManagement } from "./ProjectManagementModel";
import { developerNews } from "./DeveloperNewsModel";
import { license } from "./LicenseModel";

export interface RootModel extends Models<RootModel> {
  announcement: typeof announcement;
  userAuth: typeof userAuth;
  common: typeof common;
  juristic: typeof juristic;
  developerTeam: typeof developerTeam;
  projectManagement: typeof projectManagement;
  developerNews: typeof developerNews;
  license: typeof license;
}

export const models: RootModel = {
  announcement,
  userAuth,
  common,
  juristic,
  developerTeam,
  projectManagement,
  developerNews,
  license
};