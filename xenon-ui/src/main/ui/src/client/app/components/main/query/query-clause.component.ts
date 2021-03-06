// angular
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
// import * as _ from 'lodash';

// app
import { BooleanClause, EventContext, QueryTerm, NumericRange } from '../../../modules/app/interfaces/index';

import { QueryNestedComponent } from './query-nested.component';

@Component({
    selector: 'xe-query-clause',
    moduleId: module.id,
    templateUrl: './query-clause.component.html',
    styleUrls: ['./query-clause.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class QueryClauseComponent {
    @ViewChild(QueryNestedComponent)
    queryNestedComponent: QueryNestedComponent;

    /**
     * Uniqie ID for the clause
     */
    @Input()
    id: number;

    /**
     * Type of the clause, possible values: 'string', 'range', 'sort', 'group', 'nested'
     */
    @Input()
    type: string = 'string';

    /**
     * Whether this clause is the first one
     */
    @Input()
    isFirst: boolean = false;

    @Output()
    deleteClause = new EventEmitter<EventContext>();

    /**
     * Property match type, possible values: 'MUST_OCCUR' (equivalent of AND -- default),
     * 'MUST_NOT_OCCUR' (equivalent of NOT), 'SHOULD_OCCUR' (equivalent of OR)
     */
    occurance: string = 'MUST_OCCUR';

    /**
     * Property name to be matched/queried
     */
    propertyName: string = '';

    /**
     * Property match type, possible values: 'TERM', 'PHRASE', 'WILDCARD', 'PREFIX'
     */
    propertyMatchType: string = 'TERM';

    /**
     * Property value to be matched/queried
     */
    propertyValue: string = '';

    /**
     * In case of range query, the property value range to be matched/quried
     */
    propertyValueRange: NumericRange = {
        precisionStep: '16', // Can't change this right now
        isMaxInclusive: 'true',
        isMinInclusive: 'true',
        max: 0.0,
        min: 0.0,
        type: 'DOUBLE' // Can't change this right now
    };

    /**
     * Sort order, possible values: 'ASC', 'DESC'
     */
    sortOrder: string = 'ASC';

    getClause(): any {
        switch(this.type) {
            case 'string':
                return this.getStringClause();
            case 'range':
                return this.getRangeClause();
            case 'sort':
                return this.getSortClause();
            case 'group':
                return this.getGroupClause();
            case 'nested':
                return this.getNestedClause();
        }

        return null;
    }

    getAsNumber(value: string): number {
        return value ? parseFloat(value) : 0.0;
    }

    onDeleteClauseClicked(event: MouseEvent): void {
        this.deleteClause.emit({
            type: event.type,
            data: {
                id: this.id
            }
        });
    }

    private getStringClause(): BooleanClause {
        return {
            term: {
                matchType: this.propertyMatchType,
                matchValue: this.propertyValue,
                propertyName: this.propertyName
            },
            occurance: this.occurance
        };
    }

    private getRangeClause(): BooleanClause {
        return {
            term: {
                propertyName: this.propertyName,
                range: this.propertyValueRange
            },
            occurance: this.occurance
        };
    }

    private getSortClause(): any {
        // This can NOT be used directly in the final query spec
        return {
            sortOrder: this.sortOrder,
            sortTerm: this.propertyName
        };
    }

    private getGroupClause(): QueryTerm {
        return {
            propertyName: this.propertyName,
            propertyType: 'STRING' // Always use string
        };
    }

    private getNestedClause(): BooleanClause {
        return {
            booleanClauses: this.queryNestedComponent.getClauses(),
            occurance: this.occurance
        };
    }
}
