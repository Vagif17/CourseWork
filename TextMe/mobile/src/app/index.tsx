import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { tokenService } from "../shared/api/services/tokenService";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        async function checkToken() {
            const token = await tokenService.getToken();
            setHasToken(!!token);
            setIsLoading(false);
        }
        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c1014' }}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    if (hasToken) {
        return <Redirect href="/(tabs)" />;
    } else {
        return <Redirect href="/(auth)/login" />;
    }
}
