# Things to be done

## Enhancements
 * Support CommonJS style `exports`.
 * Support node as an environment.
 * Remove script tags of loaded scripts?
 * Remove globals of loaded scripts?
 * Experiment with sandboxing scripts into frames. Not sure that his would work or is useful.

## Testing
 * Automated testing across browsers with VMs.
 * Server to collect test results from different browsers.
 * Add tests for `require.base`.
 * Handle tests timing out better.
 
## Cleanup
 * Better docs. Describe in specific detail how the API relates to the AMD & CommonJS APIs.
 * Tidy up `eastend-worker.js` - it has had less love than the browser version.
 * Choose polyfills to endorse.
 * More function argument comments.
 * Unify worker & page versions?
