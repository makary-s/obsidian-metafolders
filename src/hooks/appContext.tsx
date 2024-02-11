import { createContext, useContext } from "react";
import { PluginContext } from "src/context";

export const AppContext = createContext<PluginContext | undefined>(undefined);

export const usePluginContext = (): PluginContext => {
	const ctx = useContext(AppContext);
	if (!ctx) {
		throw new Error(
			"usePluginContext must be used within a AppContext.Provider",
		);
	}

	return ctx;
};
