import { Buffer } from "buffer";
class CommonUtils {
  static getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

export const getBase64FromBuffer = (image: any): string => {
  let imageBase64 = "";
  if (!image) return "";
  if (typeof image === "object" && image.type === "Buffer" && image.data) {
    let buffer = new Buffer(image.data);
    let base64String = buffer.toString("base64");
    imageBase64 = `data:image/jpeg;base64,${base64String}`;
  } else if (typeof image === "string") {
    if (image.startsWith("ZGF0Y")) {
      imageBase64 = new Buffer(image, "base64").toString("binary");
    } else if (image.startsWith("data:image")) {
      imageBase64 = image;
    } else {
      imageBase64 = `data:image/jpeg;base64,${image}`;
    }
  }
  return imageBase64;
};

export default CommonUtils;
