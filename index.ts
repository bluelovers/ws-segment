/**
 * Created by user on 2018/4/12/012.
 */

import Promise = require('bluebird');

import projectConfig from './project.config';
import * as path from 'path';

export * from './version';

import requireLoader, { requireModule as requireLoaderModule } from '@novel-segment/loaders/index';
export { requireLoader, requireLoaderModule }

import getDictPath from './lib/dict';
export { getDictPath }

export const ROOT = projectConfig.project_root;
export const DICT_ROOT = projectConfig.dict_root;

export default exports as typeof import('./index');
