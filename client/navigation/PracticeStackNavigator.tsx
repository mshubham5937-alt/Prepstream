import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PracticeScreen from "@/screens/PracticeScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PracticeStackParamList = {
  Practice: undefined;
};

const Stack = createNativeStackNavigator<PracticeStackParamList>();

export default function PracticeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="PrepStream" />,
        }}
      />
    </Stack.Navigator>
  );
}
