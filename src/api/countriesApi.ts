import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DATA_BASE_URL } from "./config";

export interface Country {
  slug: string;
  name: string;
  flagUrl: string;
}

export interface SiteMetadata {
  generatedAt: string;
  countries: number;
}

export const countriesApi = createApi({
  reducerPath: "countriesApi",
  baseQuery: fetchBaseQuery({ baseUrl: DATA_BASE_URL }),
  endpoints: (builder) => ({
    getCountries: builder.query<Country[], void>({
      query: () => "countries.json",
    }),
    getMetadata: builder.query<SiteMetadata, void>({
      query: () => "metadata.json",
    }),
  }),
});

export const { useGetCountriesQuery, useGetMetadataQuery } = countriesApi;
