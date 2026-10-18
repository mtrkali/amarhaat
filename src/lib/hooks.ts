import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store"


// Use these istead of plain useDispatch / useSelector so typescrip knows our types.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();