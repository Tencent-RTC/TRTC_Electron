/**
 * 功能: 手机号检查
 * @param {String} phoneNumber
 */
export function checkPhoneNumber(phoneNumber) {
  if (!phoneNumber) return false;
  const reg = /^1[3|4|5|7|8|6|9][0-9]\d{8}$/;
  return reg.test(phoneNumber);
}

// 非国内电话号码判断
export function checkInternationalPhoneNumber(phoneNumber) {
  if(!phoneNumber) return false;
  const reg = /^[0-9]*$/;
  return reg.test(phoneNumber);
}
