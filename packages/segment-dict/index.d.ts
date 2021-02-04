/**
 * Created by user on 2018/4/12/012.
 */
export { project_root as ROOT, dict_root as DICT_ROOT } from './project.config';
export * from './version';
import requireLoader, { requireModule as requireLoaderModule } from '@novel-segment/loaders/index';
export { requireLoader, requireLoaderModule };
export { getDictPath } from './lib/dict';
declare const _default: typeof import("./index");
export default _default;
