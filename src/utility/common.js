import queryString from "query-string";

export class CommonUtility {
  static currencyFormat(value, currency) {
    if (Number.isNaN(value || 0)) {
      return value;
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value || 0);
  }

  static isNotEmpty(item) {
    return (
      item !== undefined && item !== null && item !== "" && item.length !== 0
    );
  }

  static truncateString(text, ellipsisString) {
    return (text || "").length > ellipsisString
      ? `${text.substring(0, ellipsisString)}...`
      : text;
  }

  static numberWithCommas(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  static objectToParams(obj) {
    const str = queryString.stringify(obj);
    return str;
  }

  static toTitleCase(phrase) {
    return (phrase || "")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  static timeoutPromise(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static roundNumber(num, decimals = 2) {
    if (!CommonUtility.isNotEmpty(num)) {
      return "";
    }
    const t = 10 ** decimals;
    let result = Math.round((+num + Number.EPSILON) * t) / t;
    if (num < 0) {
      result *= -1;
    }
    return result;
  }

  static extractFileName = (fullPath) => fullPath.replace(/^.*[/]/, "");

  static getInitials = (name) => {
    const temp = name.split(" ");
    let initials = temp[0].substring(0, 1).toUpperCase();

    if (temp.length > 1) {
      initials += temp[temp.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
}
