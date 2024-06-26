import createDebugger from 'debug';
import { Pulse } from '.';
import { Job, JobAttributesData } from '../job';
import { JobOptions } from '../job/repeat-every';
import { PulseError } from '../utils';

const debug = createDebugger('pulse:every');

export type EveryMethod = <T extends JobAttributesData>(
  interval: string,
  names: string | string[],
  data?: T,
  options?: JobOptions
) => Promise<Job | Job[]>;

/**
 * Creates a scheduled job with given interval and name/names of the job to run
 * @name Pulse#every
 * @function
 * @param interval - run every X interval
 * @param names - String or strings of jobs to schedule
 * @param data - data to run for job
 * @param options - options to run job for
 * @returns Job/s created. Resolves when schedule fails or passes
 */
export const every: EveryMethod = async function (this: Pulse, interval, names, data?, options?) {
  /**
   * Internal method to setup job that gets run every interval
   * @param interval run every X interval
   * @param name String job to schedule
   * @param [data] data to run for job
   * @param [options] options to run job for
   * @returns instance of job
   */
  const createJob = async <T extends JobAttributesData>(
    interval: string,
    name: string,
    data?: T,
    options?: JobOptions
  ): Promise<Job> => {
    const job = this.create(name, data || {});

    job.attrs.type = 'single';
    job.repeatEvery(interval, options);
    return job.save();
  };

  /**
   * Internal helper method that uses createJob to create jobs for an array of names
   * @param interval run every X interval
   * @param names Strings of jobs to schedule
   * @param [data] data to run for job
   * @param [options] options to run job for
   * @return array of jobs created
   */
  const createJobs = async <T extends JobAttributesData>(
    interval: string,
    names: string[],
    data?: T,
    options?: JobOptions
  ): Promise<Job[]> => {
    try {
      const jobs: Array<Promise<Job>> = [];
      names.map((name) => jobs.push(createJob(interval, name, data, options)));

      debug('every() -> all jobs created successfully');

      return Promise.all(jobs);
    } catch (error) {
      debug('every() -> error creating one or more of the jobs', error);
      throw new PulseError('Error creating one or more of the jobs');
    }
  };

  if (Array.isArray(names)) {
    debug('Pulse.every(%s, %s, %O)', interval, names, options);
    const jobs = await createJobs(interval, names, data, options);

    return jobs;
  }

  debug('Pulse.every(%s, %O, %O)', interval, names, options);
  const jobs = await createJob(interval, names, data, options);
  return jobs;
};
