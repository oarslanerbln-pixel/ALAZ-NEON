import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  { ignores: ["dist", "apps/frontend/.next", "apps/backend/dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["apps/frontend/src/app/layout.tsx", "src/pages/admin/NightlyReport.tsx", "src/pages/admin/RewardVerify.tsx", "src/pages/admin/VenueSettings.tsx", "src/pages/player/bomb/PlayerBombController.tsx", "src/pages/player/echo/PlayerEchoController.tsx", "src/pages/player/pulse/PlayerPulseController.tsx", "src/pages/player/sensor/PlayerSensorController.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off"
    }
  }
);
