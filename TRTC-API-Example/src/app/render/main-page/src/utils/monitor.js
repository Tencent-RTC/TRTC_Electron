import packageConfig from '../../package.json';

const LOCAL_STORAGE_KEY = 'reportedEvents';

class Monitor {
  appName = packageConfig.productName;

  uin = '';

  sdkAppId = 0;

  aegis;

  isOpen = true;

  reportedEventMap = {};

  constructor(options) {
    this.aegis = window.aegis;
    if (options) {
      const { sdkAppId, uin } = options;
      this.sdkAppId = sdkAppId || 0;
      this.uin = uin;
    }
    if (!this.sdkAppId) {
      this.initSdkAppId();
    }
    this.aegis.setConfig({
      uin: this.uin,
      ext2: this.appName,
      ext3: this.sdkAppId,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async initSdkAppId() {
    if (window.genTestUserSig) {
      const { sdkappid } = window.genTestUserSig(
        localStorage.getItem('localUserId') || ''
      );
      this.setSdkAppID(sdkappid);
    }
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  isUsable() {
    return this.aegis && this.isOpen;
  }

  setSdkAppID(sdkAppId) {
    this.sdkAppId = sdkAppId;
    this.aegis.setConfig({
      ext3: this.sdkAppId,
    });
  }

  setUid(uin) {
    this.uin = uin;
    this.aegis.setConfig({
      uin,
    });
  }

  info(info, extraInfo) {
    if (this.isUsable() && this.aegis?.info) {
      this.aegis.info({
        msg: info,
        ext1: extraInfo,
        trace: 'trace',
      });
    }
  }

  infoAll(info, extraInfo) {
    if (this.isUsable() && this.aegis?.infoAll) {
      this.aegis.infoAll({
        msg: info,
        ext1: extraInfo,
        trace: 'trace',
      });
    }
  }

  error(error) {
    if (this.isUsable() && this.aegis?.error) {
      this.aegis.error(error);
    }
  }

  reportEvent(eventName, extraInfo) {
    if (this.isUsable() && this.aegis?.reportEvent) {
      const eventKey = extraInfo ? `${eventName}-${extraInfo}` : eventName;
      if (!this.isEventKeyExisted(eventKey)) {
        this.aegis.reportEvent({
          name: eventName,
          ext1: eventKey,
        });
        this.storeEventKey(eventKey);
      }
    }
  }

  isEventKeyExisted(key) {
    this.loadReportedEvent();
    return !!this.reportedEventMap[key];
  }

  loadReportedEvent() {
    const reportedEventJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    let result = {};
    if (reportedEventJSON) {
      try {
        result = JSON.parse(reportedEventJSON);
      } catch (error) {
        console.error(
          `${Monitor.logPrefix} JSON.parse error:`,
          reportedEventJSON
        );
      }
    }
    this.reportedEventMap = result;
  }

  storeEventKey(key) {
    this.reportedEventMap[key] = true;
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(this.reportedEventMap)
    );
  }

  clearStorage() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

window.appMonitor = new Monitor();
