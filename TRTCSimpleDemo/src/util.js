export async function getAppPath() {
  if (!window.APP_PATH) {
    console.log("[util]getAppPath from main process ...");
    const appPath = await window.ipcRenderer.invoke("app-path");
    if (appPath) {
      window.APP_PATH = appPath;
      console.log("[util]getAppPath from main process success");
    } else {
      console.error("[util]getAppPath from main process success");
      const errorMessage = "query APP_PATH failed";
      console.error("[util]getAppPath:", errorMessage);
      throw new Error(errorMessage);
    }
  }
  return window.APP_PATH;
}
