import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";
import tailwind from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "check-file": checkFile,
      tailwindcss: tailwind,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/!(__tests__)": "NEXT_JS_APP_ROUTER_CASE",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "tailwindcss/classnames-order": "error",
      "tailwindcss/enforces-shorthand": "error",
      "tailwindcss/no-custom-classname": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/[\\u2600-\\u27BF\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/]",
          message:
            "Standard 2.1: Emojis are not allowed in code or the user interface.",
        },
        {
          selector:
            "JSXText[value=/[\\u2600-\\u27BF\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/]",
          message:
            "Standard 2.1: Emojis are not allowed in the user interface.",
        },
        {
          selector:
            "TemplateElement[value.raw=/[\\u2600-\\u27BF\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/]",
          message: "Standard 2.1: Emojis are not allowed in text templates.",
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@radix-ui/*", "@mui/base*", "@base-ui-components/*"],
              message:
                "UI Standard: Consume components from @/components/ui/. Direct consumption of base libraries (Radix/Base UI) is blocked.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/[\\u2600-\\u27BF\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/]",
          message:
            "Standard 2.1: Emojis are not allowed in code or the user interface.",
        },
        {
          selector:
            "JSXText[value=/[\\u2600-\\u27BF\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/]",
          message:
            "Standard 2.1: Emojis are not allowed in the user interface.",
        },
        {
          selector:
            "TemplateElement[value.raw=/[\\u2600-\\u27BF\\uD83C-\\uDBFF\\uDC00-\\uDFFF]/]",
          message: "Standard 2.1: Emojis are not allowed in text templates.",
        },
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            "UI Standard: Use the <Button> component from Shadcn/Base UI instead of the native HTML <button> tag.",
        },
        {
          selector: "JSXOpeningElement[name.name='input']",
          message:
            "UI Standard: Use the <Input> component from Shadcn/Base UI instead of the native HTML <input> tag.",
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            "UI Standard: Use the <Select> component from Shadcn/Base UI instead of the native HTML <select> tag.",
        },
      ],
    },
  },
  {
    files: ["src/**/index.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            ":matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, VariableDeclaration, ClassDeclaration, JSXElement, JSXFragment)",
          message:
            "Standard 2.4: Index files can only act as re-exporting hubs. Including logic or UI is prohibited.",
        },
      ],
    },
  },
]);

export default eslintConfig;