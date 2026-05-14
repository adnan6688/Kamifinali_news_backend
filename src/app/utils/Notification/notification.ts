import admin from "../../config/firebaseConfig";
import { User } from "../../modules/User/user.model";

export const sendToAllUsers = async (title: string, newsId: number) => {
    try {
        const users = await User.find({
            fcmToken: { $ne: null },
            breakingNewsNotification: true
        });

        const tokens = users
            .map((u) => u.fcmToken)
            .filter((token): token is string => Boolean(token));

        if (tokens.length === 0) {
            return {
                success: false,
                message: "No FCM tokens found",
            };
        }

        const message = {
            tokens,
            notification: {
                title,
                newsId
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
};