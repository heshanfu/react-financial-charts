import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { macd } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { MACDSeries } from "react-financial-charts/lib/series";
import { MACDTooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class MACDIndicator extends React.Component<ChartProps> {

    private readonly macdAppearance = {
        fill: {
            divergence: "#4682B4",
        },
        stroke: {
            macd: "#0093FF",
            signal: "#D84315",
        },
    };
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    private readonly macdCalculator = macd()
        .options({
            fast: 12,
            signal: 9,
            slow: 26,
        })
        .merge((d: any, c: any) => { d.macd = c; })
        .accessor((d: any) => d.macd);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const calculatedData = this.macdCalculator(initialData);

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = this.xScaleProvider(calculatedData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

        const yAccessor = this.macdCalculator.accessor();
        const options = this.macdCalculator.options();

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={this.margin}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}>
                <Chart
                    id={1}
                    yExtents={yAccessor}>
                    <XAxis />
                    <YAxis />

                    <MACDSeries
                        yAccessor={yAccessor}
                        {...this.macdAppearance} />

                    <MACDTooltip
                        origin={[8, 16]}
                        appearance={this.macdAppearance}
                        options={options}
                        yAccessor={yAccessor} />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(MACDIndicator)));
