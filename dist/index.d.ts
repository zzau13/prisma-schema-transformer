/**
 *
 * @param schema
 * @param denyList
 */
export declare function fixPrismaFile(schema: string, denyList?: readonly string[]): Promise<string>;
export * from "./deserializer";
export * from "./transformer";
