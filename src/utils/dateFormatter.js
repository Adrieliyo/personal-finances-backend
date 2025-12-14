import moment from "moment-timezone";

const getLocalTime = () => {
  return moment.tz("America/Mazatlan").format("DD-MM-YYYY HH:mm:ss");
};

const getLocalDate = () => {
  return new Date(getLocalTime());
};

export { getLocalDate, getLocalTime };
