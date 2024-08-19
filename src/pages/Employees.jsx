import React from 'react';
import { GridComponent, Inject, ColumnsDirective, ColumnDirective, Sort, Search, Page, Toolbar } from '@syncfusion/ej2-react-grids';

import { employeesData, employeesGrid } from '../data/data';
import { Header } from '../components/AdminComponents';

const Employees = () => {
  const toolbarOptions = ['Search'];

  const editing = { allowDeleting: true, allowEditing: true };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Employees" />
      <GridComponent
        dataSource={employeesData}
        allowPaging
        allowSorting
        width="auto"
        toolbar={['Search']}
      >
        <ColumnsDirective>
          {employeesGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
        </ColumnsDirective>
        <Inject services={[Search, Page, Sort, Toolbar]} />

      </GridComponent>
    </div>
  );
};
export default Employees;