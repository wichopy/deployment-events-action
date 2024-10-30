import * as httpc from '@actions/http-client';
import * as core from '@actions/core';
import * as util from 'util';

export default class LDClient {
  constructor(accessToken, baseUri) {
    this.client = new httpc.HttpClient('deployment-events-action', undefined, {
      headers: {
        Authorization: accessToken.toString('base64'),
        'User-Agent': 'deployment-events-action',
      },
    });
    this.baseUri = baseUri;
  }

  async sendDeploymentEvent(
    projectKey,
    environmentKey,
    applicationKey,
    version,
    eventType,
    eventTime,
    eventMetadata,
    deploymentMetadata,
  ) {
    const body = {
      projectKey,
      environmentKey,
      applicationKey,
      version,
      eventType,
      eventTime,
      eventMetadata,
      deploymentMetadata,
    };

    try {
      core.notice(`Sending deployment event:\n${JSON.stringify(body, null, 4)}`);
      const res = await this.client.postJson(`${this.baseUri}/api/v2/engineering-insights/deployment-events`, body);

      if (res.statusCode != 201) {
        const body = await res.readBody();
        core.error('Sending deployment failed', body);
        core.setFailed('Failed');
      }
    } catch (e) {
      console.error(util.inspect(e, { showHidden: false, depth: null, colors: true }));
      core.setFailed(e);
    }

    return;
  }
}
