const {Actions, DataTableBuilder, Renderers} = require('../../src');

const builder = new DataTableBuilder('#usersTable')
    .ajax('/api/users')
    .serverSide()
    .column('id', 'ID')
    .column('name', 'Name')
    .renderer('active', 'Status', Renderers.boolean('Active', 'Inactive'))
    .searchInput('#tableSearch')
    .filter('#statusFilter', 2)
    .menuAction()
        .addAction(Actions.view(function (row) { console.log('View', row); }))
        .addAction(Actions.edit(function (row) { console.log('Edit', row); }))
        .addAction(Actions.divider())
        .addAction(Actions.delete(function (row) { console.log('Delete', row); }));

builder.build();
