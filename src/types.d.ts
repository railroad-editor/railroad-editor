declare module "*.json"
declare module '*.jpg'

// for style loader
declare module '*.css' {
  const styles: any;
  export default styles;
}

declare module '*.svg' {
  const data: any;
  export default data;
}

