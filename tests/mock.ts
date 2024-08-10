import type { Schema } from "../src";

export const metaschema: Schema = {
    type: "struct",
    properties: [
      {
        key: "type",
        schema: { type: "string" },
      },
      {
        key: "properties",
        schema: {
          type: "array",
          items: {
            type: "struct",
            properties: [
              { key: "key", schema: { type: "string" } },
              {
                key: "schema",
                schema: {
                  type: "struct",
                  properties: [
                    {
                      key: "type",
                      schema: { type: "string" },
                    },
                    {
                      key: "properties",
                      schema: {
                        type: "struct",
                        properties: [
                          { key: "key", schema: { type: "string" } },
                          {
                            key: "schema",
                            schema: {
                              type: "string",
                            },
                          },
                        ],
                      },
                    },
                    {
                      key: "items",
                      schema: {
                        type: "struct",
                        properties: [
                          { key: "type", schema: { type: "string" } },
                          {
                            key: "properties",
                            schema: {
                              type: "struct",
                              properties: [
                                { key: "key", schema: { type: "string" } },
                                {
                                  key: "schema",
                                  schema: {
                                    type: "string",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        key: "items",
        schema: {
          type: "struct",
          properties: [
            {
              key: "type",
              schema: { type: "string" },
            },
            {
              key: "properties",
              schema: {
                type: "struct",
                properties: [
                  { key: "key", schema: { type: "string" } },
                  {
                    key: "schema",
                    schema: {
                      type: "string",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
  