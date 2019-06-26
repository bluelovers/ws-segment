"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdE1vZHVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsaXN0TW9kdWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLFNBQWdCLFdBQVcsQ0FBQyxPQUEyQixFQUFFLE9BQTBCO0lBRWxGLElBQUksR0FBRyxHQUFHO1FBQ1QsTUFBTSxFQUFFO1lBQ1AsU0FBUyxFQUFFLEVBQXFCO1lBQ2hDLFNBQVMsRUFBRSxFQUFxQjtTQUNoQztRQUNELE9BQU8sRUFBRTtZQUNSLFNBQVMsRUFBRSxFQUFxQjtZQUNoQyxTQUFTLEVBQUUsRUFBcUI7U0FDaEM7S0FDRCxDQUFDO0lBRUYsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLGNBQWMsRUFDckM7UUFDQyxPQUFPLENBQUMsU0FBUzthQUNmLE9BQU8sQ0FBQyxVQUFVLEdBQUc7WUFFckIsSUFBSSxJQUFhLENBQUM7WUFFbEIsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUNaO2dCQUNDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUM3QztvQkFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7aUJBRUQ7Z0JBQ0MsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFVLENBQUMsRUFDL0M7b0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUNGO1FBRUQsT0FBTyxDQUFDLFNBQVM7YUFDZixPQUFPLENBQUMsVUFBVSxHQUFHO1lBRXJCLElBQUksSUFBYSxDQUFDO1lBRWxCLElBQUksR0FBRyxDQUFDLElBQUksRUFDWjtnQkFDQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDN0M7b0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQztpQkFDWjthQUNEO2lCQUVEO2dCQUNDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBVSxDQUFDLEVBQy9DO29CQUNDLElBQUksR0FBRyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FDRjtLQUNEO1NBRUQ7UUFDQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDakQ7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUF0RUQsa0NBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU9wdGlvbnNEb1NlZ21lbnQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBJU3ViVG9rZW5pemVyIH0gZnJvbSAnLi4vLi4vbW9kL1Rva2VuaXplcic7XG5pbXBvcnQgeyBJU3ViT3B0aW1pemVyIH0gZnJvbSAnLi4vLi4vbW9kL09wdGltaXplcic7XG5pbXBvcnQgeyBTZWdtZW50IH0gZnJvbSAnLi4vLi4vU2VnbWVudCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0TW9kdWxlcyhtb2R1bGVzOiBTZWdtZW50W1wibW9kdWxlc1wiXSwgb3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQpXG57XG5cdGxldCByZXQgPSB7XG5cdFx0ZW5hYmxlOiB7XG5cdFx0XHR0b2tlbml6ZXI6IFtdIGFzIElTdWJUb2tlbml6ZXJbXSxcblx0XHRcdG9wdGltaXplcjogW10gYXMgSVN1Yk9wdGltaXplcltdLFxuXHRcdH0sXG5cdFx0ZGlzYWJsZToge1xuXHRcdFx0dG9rZW5pemVyOiBbXSBhcyBJU3ViVG9rZW5pemVyW10sXG5cdFx0XHRvcHRpbWl6ZXI6IFtdIGFzIElTdWJPcHRpbWl6ZXJbXSxcblx0XHR9LFxuXHR9O1xuXG5cdGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGlzYWJsZU1vZHVsZXMpXG5cdHtcblx0XHRtb2R1bGVzLnRva2VuaXplclxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG1vZClcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdFx0aWYgKG1vZC5uYW1lKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuZGlzYWJsZU1vZHVsZXMuaW5jbHVkZXMobW9kLm5hbWUpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5kaXNhYmxlTW9kdWxlcy5pbmNsdWRlcyhtb2QgYXMgYW55KSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXRbYm9vbCA/ICdkaXNhYmxlJyA6ICdlbmFibGUnXS50b2tlbml6ZXIucHVzaChtb2QpO1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRtb2R1bGVzLm9wdGltaXplclxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG1vZClcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdFx0aWYgKG1vZC5uYW1lKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuZGlzYWJsZU1vZHVsZXMuaW5jbHVkZXMobW9kLm5hbWUpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5kaXNhYmxlTW9kdWxlcy5pbmNsdWRlcyhtb2QgYXMgYW55KSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXRbYm9vbCA/ICdkaXNhYmxlJyA6ICdlbmFibGUnXS5vcHRpbWl6ZXIucHVzaChtb2QpO1xuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0cmV0LmVuYWJsZS50b2tlbml6ZXIgPSBtb2R1bGVzLnRva2VuaXplci5zbGljZSgpO1xuXHRcdHJldC5lbmFibGUub3B0aW1pemVyID0gbW9kdWxlcy5vcHRpbWl6ZXIuc2xpY2UoKTtcblx0fVxuXG5cdHJldHVybiByZXQ7XG59XG4iXX0=