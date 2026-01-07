import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "hero-antd",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "dist-custom-elements",
    },
    {
      type: "www",
      serviceWorker: null,
    },
  ],
  testing: {
    browserHeadless: "shell",
  },
};
