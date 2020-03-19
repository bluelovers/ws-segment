"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModules = void 0;
function listModules(modules, options) {
    let ret = {
        enable: {
            tokenizer: [],
            optimizer: [],
        },
        disable: {
            tokenizer: [],
            optimizer: [],
        },
    };
    if (options && options.disableModules) {
        modules.tokenizer
            .forEach(function (mod) {
            let bool;
            if (mod.name) {
                if (options.disableModules.includes(mod.name)) {
                    bool = true;
                }
            }
            else {
                if (options.disableModules.includes(mod)) {
                    bool = true;
                }
            }
            ret[bool ? 'disable' : 'enable'].tokenizer.push(mod);
        });
        modules.optimizer
            .forEach(function (mod) {
            let bool;
            if (mod.name) {
                if (options.disableModules.includes(mod.name)) {
                    bool = true;
                }
            }
            else {
                if (options.disableModules.includes(mod)) {
                    bool = true;
                }
            }
            ret[bool ? 'disable' : 'enable'].optimizer.push(mod);
        });
    }
    else {
        ret.enable.tokenizer = modules.tokenizer.slice();
        ret.enable.optimizer = modules.optimizer.slice();
    }
    return ret;
}
exports.listModules = listModules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdE1vZHVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsaXN0TW9kdWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxTQUFnQixXQUFXLENBQUMsT0FBMkIsRUFBRSxPQUEwQjtJQUVsRixJQUFJLEdBQUcsR0FBRztRQUNULE1BQU0sRUFBRTtZQUNQLFNBQVMsRUFBRSxFQUFxQjtZQUNoQyxTQUFTLEVBQUUsRUFBcUI7U0FDaEM7UUFDRCxPQUFPLEVBQUU7WUFDUixTQUFTLEVBQUUsRUFBcUI7WUFDaEMsU0FBUyxFQUFFLEVBQXFCO1NBQ2hDO0tBQ0QsQ0FBQztJQUVGLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQ3JDO1FBQ0MsT0FBTyxDQUFDLFNBQVM7YUFDZixPQUFPLENBQUMsVUFBVSxHQUFHO1lBRXJCLElBQUksSUFBYSxDQUFDO1lBRWxCLElBQUksR0FBRyxDQUFDLElBQUksRUFDWjtnQkFDQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDN0M7b0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQztpQkFDWjthQUNEO2lCQUVEO2dCQUNDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBVSxDQUFDLEVBQy9DO29CQUNDLElBQUksR0FBRyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FDRjtRQUVELE9BQU8sQ0FBQyxTQUFTO2FBQ2YsT0FBTyxDQUFDLFVBQVUsR0FBRztZQUVyQixJQUFJLElBQWEsQ0FBQztZQUVsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQ1o7Z0JBQ0MsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQzdDO29CQUNDLElBQUksR0FBRyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtpQkFFRDtnQkFDQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQVUsQ0FBQyxFQUMvQztvQkFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQ0Y7S0FDRDtTQUVEO1FBQ0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqRCxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2pEO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBdEVELGtDQXNFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElPcHRpb25zRG9TZWdtZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgSVN1YlRva2VuaXplciB9IGZyb20gJy4uLy4uL21vZC9Ub2tlbml6ZXInO1xuaW1wb3J0IHsgSVN1Yk9wdGltaXplciB9IGZyb20gJy4uLy4uL21vZC9PcHRpbWl6ZXInO1xuaW1wb3J0IHsgU2VnbWVudCB9IGZyb20gJy4uLy4uL1NlZ21lbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gbGlzdE1vZHVsZXMobW9kdWxlczogU2VnbWVudFtcIm1vZHVsZXNcIl0sIG9wdGlvbnM6IElPcHRpb25zRG9TZWdtZW50KVxue1xuXHRsZXQgcmV0ID0ge1xuXHRcdGVuYWJsZToge1xuXHRcdFx0dG9rZW5pemVyOiBbXSBhcyBJU3ViVG9rZW5pemVyW10sXG5cdFx0XHRvcHRpbWl6ZXI6IFtdIGFzIElTdWJPcHRpbWl6ZXJbXSxcblx0XHR9LFxuXHRcdGRpc2FibGU6IHtcblx0XHRcdHRva2VuaXplcjogW10gYXMgSVN1YlRva2VuaXplcltdLFxuXHRcdFx0b3B0aW1pemVyOiBbXSBhcyBJU3ViT3B0aW1pemVyW10sXG5cdFx0fSxcblx0fTtcblxuXHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRpc2FibGVNb2R1bGVzKVxuXHR7XG5cdFx0bW9kdWxlcy50b2tlbml6ZXJcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChtb2QpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdGlmIChtb2QubmFtZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChvcHRpb25zLmRpc2FibGVNb2R1bGVzLmluY2x1ZGVzKG1vZC5uYW1lKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuZGlzYWJsZU1vZHVsZXMuaW5jbHVkZXMobW9kIGFzIGFueSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0W2Jvb2wgPyAnZGlzYWJsZScgOiAnZW5hYmxlJ10udG9rZW5pemVyLnB1c2gobW9kKTtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0bW9kdWxlcy5vcHRpbWl6ZXJcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChtb2QpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdGlmIChtb2QubmFtZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChvcHRpb25zLmRpc2FibGVNb2R1bGVzLmluY2x1ZGVzKG1vZC5uYW1lKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuZGlzYWJsZU1vZHVsZXMuaW5jbHVkZXMobW9kIGFzIGFueSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0W2Jvb2wgPyAnZGlzYWJsZScgOiAnZW5hYmxlJ10ub3B0aW1pemVyLnB1c2gobW9kKTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHJldC5lbmFibGUudG9rZW5pemVyID0gbW9kdWxlcy50b2tlbml6ZXIuc2xpY2UoKTtcblx0XHRyZXQuZW5hYmxlLm9wdGltaXplciA9IG1vZHVsZXMub3B0aW1pemVyLnNsaWNlKCk7XG5cdH1cblxuXHRyZXR1cm4gcmV0O1xufVxuIl19