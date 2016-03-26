# Things to be done

## Enhancements
 * Support CommonJS style `exports`.
 * Support the AMD require API so we can set `define.amd = true`
 * Support node as an environment.
 * Remove script tags of loaded scripts?
 * Remove globals of loaded scripts?
 * Experiment with sandboxing scripts into frames. Not sure that his would work or is useful.
 * Allow bundling of dependencies with eastend into a single package.
 * Make the `dependencies` argument of `require()` optional.
 * Allow require to take an array of modules to load.
 * IE8

## Testing
 * Automated testing across browsers with VMs.
 * Server to collect test results from different browsers.
 * Add tests for `require.base`.
 * Handle tests timing out.
 * Document the test system.
 
## Cleanup
 * Better docs. Describe in specific detail how the API relates to the AMD & CommonJS APIs.
 * Choose polyfills to endorse.
 * More function argument comments.
