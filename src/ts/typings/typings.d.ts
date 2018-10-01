declare module "*.json" {
    const value: JSON | Array<JSON>;
    export default value;
}