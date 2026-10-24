import { api } from "@/shared/lib/api-client";
import type { ListResponse } from "@/shared/types/api.types";
import type { Area, Brand, Category, Person, Position } from "../types";

export const listAreas = async () =>
  (await api.get<ListResponse<Area>>("/areas")).data;

export const listPeople = async () =>
  (await api.get<ListResponse<Person>>("/people")).data;

export const listPositions = async () =>
  (await api.get<ListResponse<Position>>("/positions")).data;

export const listBrands = async () =>
  (await api.get<ListResponse<Brand>>("/brands")).data;

export const listCategories = async () =>
  (await api.get<ListResponse<Category>>("/categories")).data;
