/**
 * Constrói uma string de query (`URLSearchParams`) a partir de um objeto genérico de parâmetros,
 * ignorando valores nulos, indefinidos ou strings vazias.
 *
 * Muito útil para construir queries dinâmicas para chamadas HTTP (ex: RTK Query, Axios, etc).
 *
 * @param {Record<string, any>} params Objeto contendo os parâmetros da query (ex: filtros, paginação).
 * @returns {string} String no formato de query pronta para ser usada em URLs.
 *
 * @example
 * const params = {
 *   name: 'João',
 *   page: 2,
 *   limit: '',
 *   active: true,
 *   department: null
 * };
 *
 * const queryString = fnBuildSearchParams(params);
 * console.log(queryString); // "name=Jo%C3%A3o&page=2&active=true"
 *
 * @example
 * // Uso com RTK Query:
 * getFilteredCollaborators: build.query<
 *   { data: ICollaborator[]; links: IPaginationLinks },
 *   CollaboratorQueryParams
 * >({
 *   query: (params) => {
 *     const queryString = fnBuildSearchParams(params);
 *     return {
 *       url: `/collaborator?${queryString}`,
 *       method: 'GET',
 *     };
 *   },
 *   providesTags: ['Collaborator'],
 * });
 */

export const fnBuildSearchParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, String(item));
        });
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString() || '';
};