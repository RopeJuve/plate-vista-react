import React from 'react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  DateTime,
  Legend,
  Tooltip
} from '@syncfusion/ej2-react-charts';
import { LinePrimaryXAxis, LinePrimaryYAxis } from '../../../data/data';
import { useStateContext } from '../../../contexts/ContextProvider';

const LineChart = ({ data }) => {
  const { currentMode } = useStateContext();

  const sortedData = data.map(series => ({
    ...series,
    dataSource: series.dataSource.sort((a, b) => new Date(a.x) - new Date(b.x))
  }));

  return (
    <ChartComponent
      id='line-chart'
      height='400px'
      primaryXAxis={LinePrimaryXAxis}
      primaryYAxis={LinePrimaryYAxis}
      chartArea={{ border: { width: 0 } }}
      tooltip={{ enable: true }}
      background={currentMode === 'Dark' ? '#33373E' : '#fff'}
    >
      <Inject services={[LineSeries, DateTime, Legend, Tooltip]} />
      <SeriesCollectionDirective>
        {sortedData.map((item, index) => (
          <SeriesDirective
            key={index}
            type="Line"
            dataSource={item.dataSource}
            xName="x"
            yName="y"
            name={item.name}
          />
        ))}
      </SeriesCollectionDirective>
    </ChartComponent>
  );
};

export default LineChart;
