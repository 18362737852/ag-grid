import {
    _,
    AgGroupComponent,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    AgGroupComponentParams
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { PaddingPanel } from "./paddingPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";

export class ChartPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartGroup">
            </ag-group-component>
        </div>`;

    @RefSelector('chartGroup') private chartGroup: AgGroupComponent;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: groupParams });

        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    }

    private initGroup(): void {
        this.chartGroup
            .setTitle(this.chartTranslator.translate('chart'))
            .toggleGroupExpand(true)
            .hideEnabledCheckbox(true);
    }

    private initTitles(): void {
        const titlePanelComp = this.wireBean(new TitlePanel(this.chartController));

        this.chartGroup.addItem(titlePanelComp);
        this.activePanels.push(titlePanelComp);
    }

    private initPaddingPanel(): void {
        const paddingPanelComp = this.wireBean(new PaddingPanel(this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    }

    private initBackgroundPanel(): void {
        const backgroundPanelComp = this.wireBean(new BackgroundPanel(this.chartController));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
