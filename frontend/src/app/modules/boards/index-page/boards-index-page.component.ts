import {Component} from "@angular/core";
import {Observable} from "rxjs";
import {StateService} from "@uirouter/core";
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {BoardService} from "core-app/modules/boards/board/board.service";
import {Board} from "core-app/modules/boards/board/board";
import {BoardCacheService} from "core-app/modules/boards/board/board-cache.service";
import {NotificationsService} from "core-app/modules/common/notifications/notifications.service";

@Component({
  templateUrl: './boards-index-page.component.html'
})
export class BoardsIndexPageComponent {

  public text = {
    name: this.I18n.t('js.modals.label_name'),
    board: this.I18n.t('js.label_board'),
    boards: this.I18n.t('js.label_board_plural'),
    createdAt: this.I18n.t('js.label_created_on'),
    delete: this.I18n.t('js.button_delete'),
    areYouSure: this.I18n.t('js.text_are_you_sure'),
    deleteSuccessful: this.I18n.t('js.notice_successful_delete'),
    noResults: this.I18n.t('js.notice_no_results_to_display')
  };

  public boards$:Observable<Board[]> = this.boardCache.observeAll();

  constructor(private readonly boardService:BoardService,
              private readonly boardCache:BoardCacheService,
              private readonly I18n:I18nService,
              private readonly notifications:NotificationsService,
              private readonly state:StateService) {
    this.boardService.loadAllBoards();
  }

  get canManage() {
    return this.boardService.canManage;
  }

  newBoard() {
    this.boardService
      .create()
      .then((board) => {
        this.boardCache.update(board);
        this.state.go('boards.show', { board_id: board.id, isNew: true });
      });
  }

  destroyBoard(board:Board) {
    if (!window.confirm(this.text.areYouSure)) {
      return;
    }

    this.boardService
      .delete(board)
      .then(() => {
        this.boardCache.clearSome(board.id);
        this.notifications.addSuccess(this.text.deleteSuccessful);
      })
      .catch((error) => this.notifications.addError("Deletion failed: " + error));
  }
}
