declare module "*.vue" {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export { component };
  }
  