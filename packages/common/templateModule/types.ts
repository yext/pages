// A domain representation of a template module. Contains all fields from an imported module as well
// as metadata about the module used in downstream processing.
export interface TemplateModule {
    // The filepath to the template file. This can be the raw TSX file when used during dev mode or
    // the path to the server bundle this module was imported from during prod build.
    path: string;
    filename: string
    config: Config;
    getPath: any;
    render: any;
}

export type Config = {
    name: string;
    streamId?: string;
    stream?: Stream;
}

export type Stream = {
    $id: string;
    fields: string[];
    filter: {
        entityTypes?: string[];
        savedFilterIds?: string[];
    };
    localization: {
        locales: string[];
        primary: boolean;
    };
} 