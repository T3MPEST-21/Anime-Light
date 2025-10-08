import { readAsStringAsync } from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";

export const getUserImage = (imagePath: string | null | undefined) => {
  if (!imagePath) return require("../assets/images/avatar.png");
  // If already a full URL, return as is
  if (imagePath.startsWith("http")) return { uri: imagePath };
  // Otherwise, generate a public URL from Supabase
  const { data } = supabase.storage.from("uploads").getPublicUrl(imagePath);
  return { uri: data.publicUrl };
};

export const imageFile = async (
  folderName: string,
  fileUri: string,
  isImage: boolean = true
) => {
  try {
    let fileName = getFilePath(folderName, isImage);
    const fileBase64 = await readAsStringAsync(fileUri, { encoding: "base64" });
    let imageData = decode(fileBase64);
    let { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/*" : "video/*",
      });

    if (error || !data) {
      console.log("Error uploading image to Supabase:", error);
      return { success: false, msg: "could not upload image" };
    }
    console.log("data", data);
    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);
    return {
      success: true,
      msg: "image uploaded",
      data: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.log("Error uploading image:", error);
    return { success: false, msg: "could not upload image" };
  }
};

export const getFilePath = (folderName: string, isImage: boolean = true) => {
  const fileExtension = isImage ? ".png" : ".mp4";
  return `${folderName}/${new Date().getTime()}${fileExtension}`;
};
