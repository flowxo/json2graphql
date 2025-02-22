const fetch = require("node-fetch");
const throwError = require("./error");
const pluralize = require("pluralize");

const getObjRelationshipName = (dep) => {
  // const relName = `${dep}By${dep[0].toUpperCase()}`;
  // const final =
  //   dep.length === 1
  //     ? relName + "Id"
  //     : relName + dep.substring(1, dep.length) + "Id";
  // console.log("object", final, relName, dep);
  return dep;
};

const getArrayRelationshipName = (table, parent) => {
  // const relName = `${table}sBy${parent[0].toUpperCase()}`;
  // const final =
  //   parent.length === 1
  //     ? `${relName}Id`
  //     : `${relName}${parent.substring(1, parent.length)}Id`;
  // console.log("array", relName, final, table, parent);
  return pluralize(table);
};

const generateRelationships = (tables) => {
  const objectRelationships = [];
  const arrayRelationships = [];
  tables.forEach((table) => {
    if (table.dependencies.length > 0) {
      table.dependencies.forEach((dep) => {
        objectRelationships.push({
          type: "create_object_relationship",
          args: {
            table: table.name,
            name: `${getObjRelationshipName(dep)}`,
            using: {
              foreign_key_constraint_on: `${dep}_id`,
            },
          },
        });
        arrayRelationships.push({
          type: "create_array_relationship",
          args: {
            table: dep,
            name: `${getArrayRelationshipName(table.name, dep)}`,
            using: {
              foreign_key_constraint_on: {
                table: table.name,
                column: `${dep}_id`,
              },
            },
          },
        });
      });
    }
  });
  return {
    objectRelationships,
    arrayRelationships,
  };
};

const createRelationships = async (tables, url, headers) => {
  const relationships = generateRelationships(tables);
  const bulkQuery = {
    type: "bulk",
    args: [],
  };
  relationships.objectRelationships.forEach((or) => bulkQuery.args.push(or));
  relationships.arrayRelationships.forEach((ar) => bulkQuery.args.push(ar));
  const resp = await fetch(`${url}/v1/query`, {
    method: "POST",
    body: JSON.stringify(bulkQuery),
    headers,
  });
  if (resp.status !== 200) {
    const error = await resp.json();
    throwError(JSON.stringify(error, null, 2));
  }
};

module.exports = {
  createRelationships,
};
